import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';
import { Conversation, Message, Notification } from '../../src/types/index.ts';

const router = express.Router();

// GET /api/messages/conversations (Only user's conversations)
router.get('/conversations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const conversations = db.getConversationsForUser(userId);
  return res.json({ conversations });
});

// GET /api/messages/conversations/:id (IDOR protected: must be a participant)
router.get('/conversations/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const convId = req.params.id;

  const conv = db.getConversationById(convId);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  // IDOR check
  const isParticipant = conv.participants.some(p => p.userId === userId);
  if (!isParticipant) {
    return res.status(403).json({ error: 'Unauthorized: You do not have access to this conversation.' });
  }

  const messages = db.getMessagesForConversation(convId);

  // Mark unread messages as read
  messages.forEach(m => {
    if (m.receiverId === userId && !m.isRead) {
      m.isRead = true;
    }
  });
  db.save();

  return res.json({ conversation: conv, messages });
});

// POST /api/messages/send (Send message)
router.post('/send', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const senderId = req.user!.id;
    const { receiverId, text, relatedPropertyId } = req.body;

    if (!receiverId || !text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Receiver ID and non-empty text message are required.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send messages to yourself.' });
    }

    const receiver = db.getUserById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Recipient user not found.' });
    }

    // Harassment / Blocking check
    if (db.isUserBlocked(senderId, receiverId)) {
      return res.status(403).json({ error: 'Messaging is unavailable because one of the users has blocked communications.' });
    }

    // Find or create conversation
    let conversation = db.getConversationsForUser(senderId).find(c => 
      c.participants.some(p => p.userId === receiverId)
    );

    if (!conversation) {
      conversation = {
        id: `conv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        participants: [
          { userId: senderId, name: req.user!.name, role: req.user!.role, avatarUrl: req.user!.avatarUrl },
          { userId: receiver.id, name: receiver.name, role: receiver.role, avatarUrl: receiver.avatarUrl },
        ],
        lastMessage: text.trim(),
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
        relatedPropertyId,
      };
      db.createConversation(conversation);
    }

    const message: Message = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      conversationId: conversation.id,
      senderId,
      senderName: req.user!.name,
      receiverId,
      text: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.createMessage(message);

    // Notify receiver
    const notif: Notification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: receiverId,
      title: `Message from ${req.user!.name}`,
      message: text.trim().slice(0, 80) + (text.length > 80 ? '...' : ''),
      type: 'MESSAGE',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.createNotification(notif);

    return res.status(201).json({ message, conversationId: conversation.id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

// POST /api/messages/block
router.post('/block', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: 'Target user ID is required.' });
  }

  db.blockUser(req.user!.id, targetUserId);
  return res.json({ message: 'User blocked. You will no longer receive communications from them.' });
});

export default router;
