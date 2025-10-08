# LinkList - URL Collection Management Platform

## 🎯 Project Vision

A modern, user-friendly platform for creating and managing collections of URLs with metadata. Users can organize their bookmarks, resources, and links into themed collections with names, descriptions, and comments.

## 🌟 Core Features

### 1. User Authentication
- **Multi-Provider OAuth Support**
  - Google OAuth 2.0
  - Discord OAuth
  - Extensible to add GitHub, Twitter, etc.
- **Session Management**
  - Secure JWT-based sessions via NextAuth.js
  - Persistent login across sessions
  - Account linking (multiple providers for same user)

### 2. Collection Management

#### Collection Entity
- **Properties:**
  - `id`: Unique identifier
  - `name`: Collection title (e.g., "Design Resources", "Learning Materials")
  - `description`: Optional longer description
  - `isPublic`: Boolean for public/private visibility
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp
  - `createdById`: Foreign key to User

#### Collection Operations
- **Create**: Start a new collection with name and description
- **Read**: View all user's collections
- **Update**: Edit collection metadata
- **Delete**: Remove collection (with cascade to links)
- **Share**: Generate shareable link for public collections

### 3. Link Management

#### Link Entity
- **Properties:**
  - `id`: Unique identifier
  - `url`: Full URL (validated format)
  - `name`: Display name/title for the link
  - `comment`: Optional user notes/description
  - `order`: Integer for manual sorting
  - `collectionId`: Foreign key to Collection
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

#### Link Operations
- **Add**: Insert new link into collection
- **Edit**: Update URL, name, or comment
- **Remove**: Delete link from collection
- **Reorder**: Drag-and-drop or manual ordering
- **Batch Operations**: Import/export multiple links

### 4. User Interface

#### Dashboard View
- **Grid/List Toggle**: View collections as cards or list
- **Quick Actions**: Create new collection, search collections
- **Statistics**: Total collections, total links, recent activity
- **Filters**: Sort by date, name, link count

#### Collection Detail View
- **Header**: Collection name, description, edit button
- **Link List**: 
  - Display all links in collection
  - Inline editing capabilities
  - Quick add form at top
  - Drag handles for reordering
- **Actions**: Share, duplicate, delete collection

#### Link Display Component
```
┌─────────────────────────────────────────────┐
│ 🔗 Link Name                    [Edit] [×]  │
│ https://example.com/resource                │
│ Comment: This is a great resource for...    │
└─────────────────────────────────────────────┘
```

## 🏗️ Technical Architecture (T3 Stack)

### Database Schema (Prisma)

```prisma
model User {
  id            String       @id @default(cuid())
  name          String?
  email         String       @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  collections   Collection[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  createdBy   User     @relation(fields: [createdById], references: [id], onDelete: Cascade)
  createdById String
  
  links       Link[]
  
  @@index([createdById])
  @@index([createdAt])
}

model Link {
  id           String     @id @default(cuid())
  url          String
  name         String
  comment      String?
  order        Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  collectionId String
  
  @@index([collectionId])
  @@index([order])
}
```

### API Layer (tRPC Routers)

#### Collection Router (`src/server/api/routers/collection.ts`)
```typescript
export const collectionRouter = createTRPCRouter({
  // Get all collections for current user
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.collection.findMany({
      where: { createdById: ctx.session.user.id },
      include: { _count: { select: { links: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }),

  // Get single collection with all links
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.collection.findFirst({
        where: { 
          id: input.id, 
          createdById: ctx.session.user.id 
        },
        include: { 
          links: { orderBy: { order: 'asc' } } 
        },
      });
    }),

  // Create new collection
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.collection.create({
        data: {
          ...input,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  // Update collection
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.db.collection.updateMany({
        where: { 
          id: input.id, 
          createdById: ctx.session.user.id 
        },
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
        },
      });
    }),

  // Delete collection
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.collection.deleteMany({
        where: { 
          id: input.id, 
          createdById: ctx.session.user.id 
        },
      });
    }),
});
```

#### Link Router (`src/server/api/routers/link.ts`)
```typescript
export const linkRouter = createTRPCRouter({
  // Add link to collection
  create: protectedProcedure
    .input(z.object({
      collectionId: z.string(),
      url: z.string().url(),
      name: z.string().min(1).max(200),
      comment: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify collection belongs to user
      const collection = await ctx.db.collection.findFirst({
        where: { 
          id: input.collectionId, 
          createdById: ctx.session.user.id 
        },
      });
      
      if (!collection) throw new TRPCError({ code: 'FORBIDDEN' });
      
      // Get max order for new link
      const maxOrder = await ctx.db.link.findFirst({
        where: { collectionId: input.collectionId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      
      return ctx.db.link.create({
        data: {
          ...input,
          order: (maxOrder?.order ?? 0) + 1,
        },
      });
    }),

  // Update link
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      url: z.string().url().optional(),
      name: z.string().min(1).max(200).optional(),
      comment: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify link belongs to user's collection
      const link = await ctx.db.link.findFirst({
        where: { id: input.id },
        include: { collection: true },
      });
      
      if (link?.collection.createdById !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      return ctx.db.link.update({
        where: { id: input.id },
        data: {
          url: input.url,
          name: input.name,
          comment: input.comment,
        },
      });
    }),

  // Delete link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const link = await ctx.db.link.findFirst({
        where: { id: input.id },
        include: { collection: true },
      });
      
      if (link?.collection.createdById !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      return ctx.db.link.delete({
        where: { id: input.id },
      });
    }),

  // Reorder links
  reorder: protectedProcedure
    .input(z.object({
      collectionId: z.string(),
      linkIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify collection ownership
      const collection = await ctx.db.collection.findFirst({
        where: { 
          id: input.collectionId, 
          createdById: ctx.session.user.id 
        },
      });
      
      if (!collection) throw new TRPCError({ code: 'FORBIDDEN' });
      
      // Update order for each link
      const updates = input.linkIds.map((linkId, index) =>
        ctx.db.link.updateMany({
          where: { id: linkId, collectionId: input.collectionId },
          data: { order: index },
        })
      );
      
      return ctx.db.$transaction(updates);
    }),
});
```

### Authentication Configuration

#### NextAuth Setup (`src/server/auth/config.ts`)
```typescript
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";

export const authConfig = {
  providers: [
    Discord,
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // ... existing config
} satisfies NextAuthConfig;
```

#### Environment Variables (`src/env.js`)
```javascript
server: {
  // Existing vars...
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  // Discord vars already configured
}
```

## 🎨 User Experience Flow

### First-Time User Journey
1. Land on homepage → See "Sign in with Google/Discord" buttons
2. Choose provider → OAuth redirect → Return authenticated
3. See empty dashboard with "Create Your First Collection" CTA
4. Create collection → Name it → Add first link
5. Success state: View collection with first link

### Returning User Journey
1. Land on homepage → Auto-redirect to dashboard (if authenticated)
2. See grid of existing collections with link counts
3. Click collection → View/edit links
4. Quick add new link via top form
5. Share public collections via generated link

### Mobile Experience
- Responsive design with Tailwind breakpoints
- Bottom navigation for quick access
- Swipe gestures for delete/edit
- Pull-to-refresh collections list

## 🚀 Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Database schema setup (User, Collection, Link models)
- [ ] Authentication with Discord + Google
- [ ] Basic collection CRUD operations
- [ ] Basic link CRUD operations
- [ ] Simple dashboard UI
- [ ] Collection detail view

### Phase 2: Enhanced Features
- [ ] Drag-and-drop link reordering
- [ ] Public collection sharing
- [ ] Search within collections
- [ ] Bulk link import (JSON/CSV)
- [ ] Link preview metadata fetching
- [ ] Collection templates

### Phase 3: Advanced Features
- [ ] Collaborative collections (multiple owners)
- [ ] Tags and categories
- [ ] Link health checking (detect dead links)
- [ ] Browser extension for quick add
- [ ] Export to various formats
- [ ] Analytics (click tracking)

### Phase 4: Polish
- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Undo/redo support
- [ ] Activity feed
- [ ] Email notifications
- [ ] API for third-party integrations

## 🔒 Security Considerations

- **Authorization**: All mutations verify ownership via `createdById`
- **Input Validation**: Zod schemas validate all user input
- **URL Sanitization**: Validate URL format to prevent XSS
- **Rate Limiting**: Implement rate limits on API endpoints
- **CSRF Protection**: NextAuth handles CSRF tokens
- **SQL Injection**: Prisma ORM prevents SQL injection

## 📊 Success Metrics

- User sign-ups per week
- Average collections per user
- Average links per collection
- Daily active users
- Collection shares (public links clicked)
- User retention rate (30-day)

## 🎯 Competitive Advantages

- **Speed**: Built on Next.js 15 with React Server Components
- **Type Safety**: End-to-end type inference with tRPC
- **Modern Stack**: Latest T3 Stack conventions
- **Simple UX**: Focus on core functionality without bloat
- **Privacy First**: Private by default, public by choice
- **Self-Hostable**: Open source, can be deployed anywhere

## 💡 Future Possibilities

- Chrome/Firefox extension for one-click saving
- Mobile apps (React Native with same tRPC backend)
- AI-powered link categorization
- Social features (follow users, discover collections)
- Integration with note-taking apps (Notion, Obsidian)
- Wayback Machine integration for link archival
- RSS feed generation per collection

---

**Tech Stack Summary:**
- **Framework**: Next.js 15 (App Router)
- **API**: tRPC with React Query
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with Google + Discord
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **Validation**: Zod schemas
- **Deployment**: Vercel (recommended)
