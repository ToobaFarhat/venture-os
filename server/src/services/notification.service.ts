import { Notification, WorkspaceMember } from '../models';
import mongoose from 'mongoose';

export interface CreateNotificationParams {
  workspaceId: string | mongoose.Types.ObjectId;
  userId?: string | mongoose.Types.ObjectId; // If null, broadcasts to all workspace members
  title: string;
  message: string;
  type: 'lead' | 'task' | 'feedback' | 'risk' | 'automation' | 'system';
  link?: string;
}

export class NotificationService {
  public static async send(params: CreateNotificationParams): Promise<void> {
    try {
      if (params.userId) {
        await Notification.create({
          workspaceId: new mongoose.Types.ObjectId(params.workspaceId.toString()),
          userId: new mongoose.Types.ObjectId(params.userId.toString()),
          title: params.title,
          message: params.message,
          type: params.type,
          link: params.link,
          read: false,
        });
      } else {
        // Broadcast to all active members of the workspace
        const members = await WorkspaceMember.find({
          workspaceId: new mongoose.Types.ObjectId(params.workspaceId.toString()),
          status: 'active',
        });

        const notifications = members.map((m) => ({
          workspaceId: new mongoose.Types.ObjectId(params.workspaceId.toString()),
          userId: m.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          link: params.link,
          read: false,
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    } catch (err) {
      console.error('[NotificationService] Failed to send notification:', err);
    }
  }

  public static async getUserNotifications(workspaceId: string, userId: string, limit = 30) {
    return Notification.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  public static async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(notificationId), userId: new mongoose.Types.ObjectId(userId) },
      { read: true },
      { new: true }
    );
  }

  public static async markAllAsRead(workspaceId: string, userId: string) {
    return Notification.updateMany(
      { workspaceId: new mongoose.Types.ObjectId(workspaceId), userId: new mongoose.Types.ObjectId(userId) },
      { read: true }
    );
  }
}
