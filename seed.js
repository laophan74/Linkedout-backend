import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from './models/User.js'
import { Post } from './models/Post.js'
import { Comment } from './models/Comment.js'
import { Chat } from './models/Chat.js'
import { Message } from './models/Message.js'
import { Activity } from './models/Activity.js'

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('📝 Clearing database...')
    await User.deleteMany({})
    await Post.deleteMany({})
    await Comment.deleteMany({})
    await Chat.deleteMany({})
    await Message.deleteMany({})
    await Activity.deleteMany({})

    console.log('👥 Creating users...')
    const users = await User.create([
      {
        username: 'guest',
        email: 'guest@example.com',
        password: 'guest123',
        fullname: 'Guest User',
        bio: 'Welcome to Linkedout! I am a guest user testing the platform.',
        phone: '+84-123-456',
        address: 'Vietnam',
        website: '',
        imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
      },
      {
        username: 'john_dev',
        email: 'john@example.com',
        password: 'password123',
        fullname: 'John Developer',
        bio: 'Full Stack Developer | React & Node.js Enthusiast',
        phone: '+84-987-654',
        address: 'Ho Chi Minh City',
        website: 'https://john.dev',
        imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      },
      {
        username: 'sarah_design',
        email: 'sarah@example.com',
        password: 'password123',
        fullname: 'Sarah Designer',
        bio: 'UI/UX Designer | Creating beautiful digital experiences',
        phone: '+84-555-666',
        address: 'Da Nang',
        website: '',
        imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      },
      {
        username: 'mike_pm',
        email: 'mike@example.com',
        password: 'password123',
        fullname: 'Mike Manager',
        bio: 'Product Manager | Building great products',
        phone: '+84-111-222',
        address: 'Hanoi',
        website: '',
        imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      },
      {
        username: 'emma_marketing',
        email: 'emma@example.com',
        password: 'password123',
        fullname: 'Emma Marketing',
        bio: 'Marketing Specialist | Content & Growth',
        phone: '+84-777-888',
        address: 'Can Tho',
        website: '',
        imgUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      },
    ])

    // Add connections
    users[0].connections = [users[1]._id, users[2]._id, users[3]._id]
    users[1].connections = [users[0]._id, users[2]._id]
    users[2].connections = [users[0]._id, users[1]._id, users[4]._id]
    users[3].connections = [users[0]._id, users[4]._id]
    users[4].connections = [users[2]._id, users[3]._id]

    await Promise.all(users.map(u => u.save()))

    console.log('📝 Creating posts...')
    const posts = await Post.create([
      {
        createdBy: users[1]._id,
        txt: 'Just launched my new React project! Building amazing web applications with modern tech stack. Check out my portfolio! 🚀',
        imgUrl: 'https://images.unsplash.com/photo-1517694712202-14dd05513371?w=400',
        likes: [users[0]._id, users[2]._id],
        comments: [],
        shares: 5,
      },
      {
        createdBy: users[2]._id,
        txt: 'Design inspiration: Beautiful UI components for modern web applications. What do you think about this color palette? 🎨',
        imgUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        likes: [users[0]._id, users[1]._id, users[4]._id],
        comments: [],
        shares: 8,
      },
      {
        createdBy: users[3]._id,
        txt: 'The future of tech is here! AI and Machine Learning are transforming industries. Excited to see what comes next. 🤖',
        imgUrl: 'https://images.unsplash.com/photo-1677442d019cecf71a9ee186658bbb75?w=400',
        likes: [users[0]._id, users[1]._id, users[2]._id],
        comments: [],
        shares: 12,
      },
      {
        createdBy: users[4]._id,
        txt: 'Content marketing tips that really work! 📝 Creating valuable content is the key to audience engagement. Share your best practices!',
        imgUrl: '',
        likes: [users[0]._id, users[2]._id],
        comments: [],
        shares: 3,
      },
      {
        createdBy: users[0]._id,
        txt: 'Welcome to Linkedout! A modern professional network where connections matter. Let\'s build something great together! 💼',
        imgUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        likes: [users[1]._id, users[2]._id, users[3]._id, users[4]._id],
        comments: [],
        shares: 15,
      },
    ])

    console.log('💬 Creating comments...')
    const comments = await Comment.create([
      {
        postId: posts[0]._id,
        createdBy: users[2]._id,
        txt: 'Amazing work! Love the architecture of your React project.',
        likes: [users[0]._id],
      },
      {
        postId: posts[0]._id,
        createdBy: users[3]._id,
        txt: 'This looks really professional. Great job on the implementation!',
        likes: [],
      },
      {
        postId: posts[1]._id,
        createdBy: users[1]._id,
        txt: 'Love these colors! Perfect for modern applications. 🎨',
        likes: [users[0]._id, users[4]._id],
      },
      {
        postId: posts[4]._id,
        createdBy: users[1]._id,
        txt: 'Excited to be part of this network! Looking forward to connecting with amazing professionals.',
        likes: [users[2]._id, users[3]._id],
      },
    ])

    // Update posts with comments
    posts[0].comments = [comments[0]._id, comments[1]._id]
    posts[1].comments = [comments[2]._id]
    posts[4].comments = [comments[3]._id]
    await Promise.all(posts.map(p => p.save()))

    console.log('💬 Creating chats...')
    const chats = await Chat.create([
      {
        users: [users[0]._id, users[1]._id],
        lastMsg: 'Sounds good! Let\'s discuss the project details.',
        lastMsgSender: users[1]._id,
      },
      {
        users: [users[0]._id, users[2]._id],
        lastMsg: 'The design looks fantastic! Can we schedule a call?',
        lastMsgSender: users[2]._id,
      },
      {
        users: [users[1]._id, users[3]._id],
        lastMsg: 'Meeting went great! Let\'s move forward with the plan.',
        lastMsgSender: users[1]._id,
      },
      {
        users: [users[2]._id, users[4]._id],
        lastMsg: 'Thanks for sharing the insights! Really helpful.',
        lastMsgSender: users[4]._id,
      },
    ])

    console.log('✉️ Creating messages...')
    await Message.create([
      {
        chatId: chats[0]._id,
        from: users[1]._id,
        to: users[0]._id,
        txt: 'Hey! Did you see my last project?',
      },
      {
        chatId: chats[0]._id,
        from: users[0]._id,
        to: users[1]._id,
        txt: 'Yes! It looks amazing! Great work on the UI.',
      },
      {
        chatId: chats[0]._id,
        from: users[1]._id,
        to: users[0]._id,
        txt: 'Thanks! Want to collaborate on something?',
      },
      {
        chatId: chats[0]._id,
        from: users[0]._id,
        to: users[1]._id,
        txt: 'Definitely! I\'d love to work together.',
      },
      {
        chatId: chats[0]._id,
        from: users[1]._id,
        to: users[0]._id,
        txt: 'Sounds good! Let\'s discuss the project details.',
      },
      {
        chatId: chats[1]._id,
        from: users[2]._id,
        to: users[0]._id,
        txt: 'Hi! I loved your recent post about the new features.',
      },
      {
        chatId: chats[1]._id,
        from: users[0]._id,
        to: users[2]._id,
        txt: 'Thank you! I\'m really excited about this update.',
      },
      {
        chatId: chats[1]._id,
        from: users[2]._id,
        to: users[0]._id,
        txt: 'The design looks fantastic! Can we schedule a call?',
      },
    ])

    console.log('🔔 Creating activities...')
    await Activity.create([
      {
        type: 'like',
        actor: users[1]._id,
        targetUser: users[0]._id,
        targetId: posts[4]._id.toString(),
        targetType: 'post',
        isRead: false,
      },
      {
        type: 'comment',
        actor: users[2]._id,
        targetUser: users[0]._id,
        targetId: posts[4]._id.toString(),
        targetType: 'post',
        isRead: false,
      },
      {
        type: 'message',
        actor: users[1]._id,
        targetUser: users[0]._id,
        targetId: chats[0]._id.toString(),
        targetType: 'chat',
        isRead: false,
      },
    ])

    console.log('✅ Database seeded successfully!')
    console.log(`✨ Created ${users.length} users`)
    console.log(`✨ Created ${posts.length} posts`)
    console.log(`✨ Created ${comments.length} comments`)
    console.log(`✨ Created ${chats.length} chats`)
    console.log(`✨ Created 8 messages`)
    console.log(`✨ Created 3 activities`)
    console.log('\n🔑 Test credentials:')
    console.log('  Username: guest')
    console.log('  Password: guest')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
