import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ThreadPage from './ThreadPage.jsx';

const { query } = vi.hoisted(() => ({ query: { current: {} } }));
vi.mock('../../queries/enquiries.js', () => ({
  useThread: () => query.current,
  useMarkThreadRead: () => ({ mutate: vi.fn() }),
  useSendEnquiry: () => ({ mutateAsync: vi.fn() }),
  useSendMessage: () => ({ mutateAsync: vi.fn() }),
}));
beforeEach(() => {
  query.current = {
    data: { thread: { id: 'thread-1', businessName: 'Test shop' }, messages: [] },
    isLoading: false, isError: false, refetch: vi.fn(),
  };
});
function render(as = 'customer') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/enquiries/thread-1']}>
      <Routes><Route path="/enquiries/:threadId" element={<ThreadPage as={as} />} /></Routes>
    </MemoryRouter>,
  );
}

describe('conversation page states', () => {
  it('renders only one bubble for a repeated persisted message ID', () => {
    const message = { id: '1', body: 'Unique message text', fromMe: true, createdAt: '2026-11-08T12:00:00Z' };
    query.current.data.messages = [message, { ...message }];
    expect(render().match(/Unique message text/g)).toHaveLength(1);
  });

  it.each(['customer', 'seller'])('unavailable %s thread hides messages and composer and provides the role fallback', (as) => {
    query.current.data = null;
    const html = render(as);
    expect(html).toContain('Conversation unavailable');
    expect(html).not.toContain('textarea');
    expect(html).not.toContain('No messages yet');
    expect(html).toContain(`href="${as === 'seller' ? '/seller/enquiries' : '/enquiries'}"`);
  });

  it('empty available thread keeps its composer', () => {
    const html = render();
    expect(html).toContain('No messages yet');
    expect(html).toContain('textarea');
  });

  it('loading thread displays a skeleton, without unavailable text or a composer', () => {
    query.current.data = undefined;
    query.current.isLoading = true;
    const html = render();
    expect(html).toContain('Loading messages');
    expect(html).not.toContain('Conversation unavailable');
    expect(html).not.toContain('textarea');
  });

  it('error state offers retry instead of sending into a stale thread', () => {
    query.current.isError = true;
    query.current.error = new Error('offline');
    const html = render();
    expect(html).toContain('Try again');
    expect(html).not.toContain('textarea');
  });
});
