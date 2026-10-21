import { ConversationSession } from '@/types/chat';

export const SAMPLE_CONVERSATIONS: ConversationSession[] = [
  {
    id: 'demo_session_ref',
    title: 'New Chat',
    createdAt: 'March 12, 2025',
    updatedAt: 'March 12, 2025',
    pinned: true,
    messages: [
      {
        id: 'msg_ref_1',
        sender: 'bot',
        text: `• **AI-Driven Personalization** – Adaptive interfaces based on user behavior.
• **Minimalist 3D Design** – Subtle 3D elements enhancing usability.
• **Gesture-Based Navigation** – More fluid and natural interactions.
• **Voice & AI Assistants** – Integrated into user experiences.

Need a visual representation of this data?`,
        timestamp: '11:42 AM',
        source: 'faq',
        sentiment: { label: 'positive', score: 0.3 },
      },
      {
        id: 'msg_ref_2',
        sender: 'user',
        text: 'Summarize it for me',
        timestamp: '11:43 AM',
      },
      {
        id: 'msg_ref_3',
        sender: 'bot',
        text: 'Sure! In 2025, UX/UI will focus on AI-driven personalization, sleek 3D visuals, intuitive gestures, and deeper integration of voice assistants.',
        timestamp: '11:44 AM',
        source: 'document',
        sentiment: { label: 'positive', score: 0.5 },
      },
      {
        id: 'msg_ref_4',
        sender: 'user',
        text: '',
        timestamp: '11:45 AM',
        attachments: [
          {
            id: 'att_ref_1',
            name: 'Design concept.pdf',
            size: 1200000,
            category: 'document',
            extension: '.pdf',
            status: 'ready',
          },
        ],
      },
    ],
  },
  {
    id: 'demo_session_pinned_2',
    title: 'Project Proposal Summary',
    createdAt: 'March 3, 2025',
    updatedAt: 'March 3, 2025',
    pinned: true,
    messages: [
      {
        id: 'msg_p2_1',
        sender: 'user',
        text: 'Provide an executive summary of the Q2 project proposal deliverables.',
        timestamp: '10:00 AM',
      },
      {
        id: 'msg_p2_2',
        sender: 'bot',
        text: 'The Q2 project proposal focuses on automating customer onboarding, reducing time-to-value by 40%, and integrating unified multimodal search across internal repositories.',
        timestamp: '10:01 AM',
        source: 'faq',
        sentiment: { label: 'positive', score: 0.4 },
      },
    ],
  },
  {
    id: 'demo_session_pinned_3',
    title: 'Customer analysis',
    createdAt: 'March 3, 2025',
    updatedAt: 'March 3, 2025',
    pinned: true,
    messages: [
      {
        id: 'msg_p3_1',
        sender: 'user',
        text: 'Show segment distribution for enterprise vs mid-market accounts.',
        timestamp: '3:20 PM',
      },
      {
        id: 'msg_p3_2',
        sender: 'bot',
        text: 'Enterprise accounts account for 68% of Annual Recurring Revenue with a 98.4% net retention rate. Mid-market represents 32% with fastest quarterly expansion in EMEA.',
        timestamp: '3:22 PM',
        source: 'document',
        sentiment: { label: 'positive', score: 0.35 },
      },
    ],
  },
  {
    id: 'demo_session_today_1',
    title: 'Best tools for UX research',
    createdAt: '10:30 AM',
    updatedAt: '10:30 AM',
    messages: [
      {
        id: 'msg_t1_1',
        sender: 'user',
        text: 'What are the top modern tools for qualitative UX user testing and heatmaps?',
        timestamp: '10:30 AM',
      },
      {
        id: 'msg_t1_2',
        sender: 'bot',
        text: 'Leading platforms include Maze for rapid prototype testing, Lookback for moderated user interviews, Hotjar for session replays, and Dovetail for thematic synthesis.',
        timestamp: '10:31 AM',
        source: 'faq',
        sentiment: { label: 'neutral', score: 0.2 },
      },
    ],
  },
  {
    id: 'demo_session_yesterday_1',
    title: 'CRM Dashboard Visualization',
    createdAt: '2:15 PM',
    updatedAt: '2:15 PM',
    messages: [
      {
        id: 'msg_y1_1',
        sender: 'user',
        text: 'Generate visual preview metrics for monthly active conversions.',
        timestamp: '2:15 PM',
      },
      {
        id: 'msg_y1_2',
        sender: 'bot',
        text: 'CRM dashboard telemetry highlights 22,456 total conversions (+14% MoM) with 4,766 verified enterprise leads and 2,491 pending activations.',
        timestamp: '2:16 PM',
        source: 'document',
        sentiment: { label: 'positive', score: 0.5 },
      },
    ],
  },
  {
    id: 'demo_session_yesterday_2',
    title: 'Translate email to Spanish',
    createdAt: '4:15 PM',
    updatedAt: '4:15 PM',
    messages: [
      {
        id: 'msg_y2_1',
        sender: 'user',
        text: 'Translate this deployment confirmation notice into Spanish.',
        timestamp: '4:15 PM',
      },
      {
        id: 'msg_y2_2',
        sender: 'bot',
        text: 'Estimado equipo: Nos complace confirmar que el nuevo despliegue del sistema se ha completado con exito. Todos los servicios estan operando con normalidad.',
        timestamp: '4:16 PM',
        source: 'faq',
        sentiment: { label: 'positive', score: 0.3 },
      },
    ],
  },
  {
    id: 'demo_session_past_1',
    title: 'Summarize this article',
    createdAt: 'March 29, 2025',
    updatedAt: 'March 29, 2025',
    messages: [
      {
        id: 'msg_pa1_1',
        sender: 'user',
        text: 'Provide key takeaways from the design systems whitepaper.',
        timestamp: '2:15 PM',
      },
      {
        id: 'msg_pa1_2',
        sender: 'bot',
        text: 'Key takeaways: Design token synchronization between Figma and code reduces handoff latency by 65% and guarantees zero UI drift across multi-platform teams.',
        timestamp: '2:16 PM',
        source: 'faq',
        sentiment: { label: 'positive', score: 0.4 },
      },
    ],
  },
];
