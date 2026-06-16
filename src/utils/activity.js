import { Activity } from '../models/Activity.js'

export async function createActivity({ type, createdBy, createdTo, postId, chatId }) {
  if (!type || !createdBy || !createdTo) return null
  if (createdBy.toString() === createdTo.toString()) return null

  const activity = new Activity({
    type,
    createdBy,
    createdTo,
    postId,
    chatId,
  })

  await activity.save()
  return activity
}
