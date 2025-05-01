# Dyprodg. Personal AI

A modern AI assistant platform with user authentication and protected content.

## Features

- Next.js 15 with App Router
- Clerk Authentication
- Groq AI Integration
- TailwindCSS for styling
- Responsive design
- Protected AI dashboard
- Interactive chat with code highlighting
- Markdown rendering for rich AI responses
- Redis/Upstash KV for chat history persistence
- End-to-end encryption for chat data stored in Redis

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Clerk:
   - Create an account on [clerk.com](https://clerk.com)
   - Create a new application
   - Add your Clerk publishable key and secret key to a `.env.local` file:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
     CLERK_SECRET_KEY=your_secret_key
     ```

4. Set up Groq:
   - Create an account on [groq.com](https://console.groq.com/)
   - Generate an API key
   - Add your Groq API key to the `.env.local` file:
     ```
     GROQ_API_KEY=your_groq_api_key
     ```

5. Set up Redis/KV Storage:
   - Create an account on [Upstash](https://upstash.com/) or another Redis provider
   - Create a new Redis database
   - Get your REST API URL and Token
   - Add them to your `.env.local` file:
     ```
     KV_REST_API_URL=your_redis_rest_url
     KV_REST_API_TOKEN=your_redis_token
     ```
   - For read-only operations, you can also specify (optional):
     ```
     KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
     ```

6. Set up Encryption (required for chat data security):
   - Generate a strong encryption key (at least 32 characters)
   - Add it to your `.env.local` file:
     ```
     ENCRYPTION_KEY=your_very_strong_and_secure_encryption_key_here
     ```
   - You can generate a secure key with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - If upgrading from a previous version, migrate existing chats:
     ```bash
     npx ts-node scripts/migrate-to-encrypted.ts
     ```

7. Run the development server:
   ```bash
   npm run dev
   ```

## Structure

- `/` - Landing page with sign-in and sign-up options
- `/sign-in` - Clerk sign-in page
- `/sign-up` - Clerk sign-up page
- `/dashboard` - Protected AI dashboard for authenticated users
- `/chat` - Interactive AI chat interface with Groq integration
- `/api/chat` - Protected API route for Groq AI completions

## Customization

- **Navbar**: Modify `src/components/Navbar.tsx` to change the navigation
- **Landing Page**: Update `src/app/page.tsx` to customize the landing page
- **Dashboard**: Edit `src/app/dashboard/page.tsx` for the AI assistant features
- **Chat**: Customize the chat interface in `src/app/chat/page.tsx`
- **AI Model**: Change the Groq model in `src/app/api/chat/route.ts`

## Deployment

You can deploy this application to Vercel or any other hosting service that supports Next.js.

```bash
npm run build
```

## Troubleshooting

### Redis Connection Issues
- Make sure your KV_REST_API_URL and KV_REST_API_TOKEN are correctly set in your `.env.local` file
- Check that your Redis database is properly created and accessible
- For local development, the app will fall back to in-memory storage if Redis credentials are missing

### Encryption Issues
- Ensure the ENCRYPTION_KEY environment variable is set in your `.env.local` file
- If you see "ENCRYPTION_KEY environment variable is not set" errors, check that the key is available in your environment
- For deployment, make sure to add the ENCRYPTION_KEY to your environment variables in your hosting provider

## License

MIT
