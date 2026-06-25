'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Bot } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { AI_ASSISTANT_NAME } from '@/lib/ai-assistant';

const showAI = [
  '/',
  '/trips',
  '/trip/*',
  '/trips/*',
  '/booking',
  '/booking/*',
  '/seat-selection',
  '/checkout',
  '/lookup',
] as const;

type ChatMessage = {
  role: string;
  content: string;
  sources?: string[];
};

function matchesAIPath(pathname: string) {
  return showAI.some((route) => {
    if (route.endsWith('/*')) {
      return pathname === route.slice(0, -2) || pathname.startsWith(`${route.slice(0, -2)}/`);
    }
    return pathname === route;
  });
}

export default function CapyAI() {
  const pathname = usePathname();
  const isVisible = useMemo(() => matchesAIPath(pathname), [pathname]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  if (!isVisible) return null;

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const newMsgs: ChatMessage[] = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Lỗi máy chủ (${res.status})`);
      setChatMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: data.reply || 'Không nhận được phản hồi.',
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ]);
    } catch (err) {
      const hint =
        err instanceof TypeError
          ? `Không kết nối được ${AI_ASSISTANT_NAME}.`
          : err instanceof Error
            ? err.message
            : `${AI_ASSISTANT_NAME} tạm thời không khả dụng.`;
      setChatMessages([...newMsgs, { role: 'assistant', content: hint }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        aria-label={`Mở ${AI_ASSISTANT_NAME}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ink py-3 pl-4 pr-5 text-white shadow-overlay ring-1 ring-white/10"
      >
        <Bot className="h-5 w-5 text-accent" />
        <span className="text-sm font-semibold">{AI_ASSISTANT_NAME}</span>
      </motion.button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="fixed bottom-24 right-6 z-50 flex h-[400px] w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-overlay"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white">
              <Bot className="h-5 w-5" />
              <div>
                <p className="text-caption font-semibold">{AI_ASSISTANT_NAME}</p>
                <p className="text-micro text-white/70">Trợ lý đặt vé thông minh</p>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-auto p-4">
              {chatMessages.length === 0 && (
                <p className="text-center text-caption text-ink-muted">
                  Hỏi về chuyến xe, giá vé hoặc chính sách hủy
                </p>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-caption whitespace-pre-wrap',
                      m.role === 'user' ? 'bg-brand text-white' : 'bg-surface-sunken text-ink'
                    )}
                  >
                    {m.content}
                  </span>
                  {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                    <div className="mt-1.5 flex max-w-[90%] flex-wrap gap-1">
                      {m.sources.map((src) => (
                        <span
                          key={src}
                          className="inline-flex items-center gap-1 rounded-full border border-brand/15 bg-brand-50 px-2 py-0.5 text-micro text-brand"
                        >
                          <BookOpen className="h-3 w-3 shrink-0" />
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-3">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder={`Hỏi ${AI_ASSISTANT_NAME}...`}
                className="flex-1"
              />
              <Button type="button" onClick={sendChat} disabled={chatLoading} size="sm">
                {chatLoading ? '...' : 'Gửi'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
