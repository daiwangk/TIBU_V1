import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const BOTTOM_TOLERANCE = 48;

export default function useThreadViewport(latestId) {
  const viewportRef = useRef(null);
  const messagesRef = useRef(null);
  const [readingFrom, setReadingFrom] = useState(null);
  if (latestId == null && readingFrom !== null) setReadingFrom(null);
  const following = readingFrom === null;

  useEffect(() => {
    const viewport = window.visualViewport;
    const page = viewportRef.current;
    const messages = messagesRef.current;
    if (!page || !messages) return;
    function keepLatestVisible() {
      if (following) messages.scrollTop = messages.scrollHeight;
    }
    function fitViewport() {
      if (viewport?.scale !== 1) return;
      page.style.setProperty('--chat-height', `${viewport.height}px`);
    }
    fitViewport();
    viewport?.addEventListener('resize', fitViewport);
    const observer = new ResizeObserver(keepLatestVisible);
    observer.observe(messages);
    return () => {
      observer.disconnect();
      viewport?.removeEventListener('resize', fitViewport);
    };
  }, [following]);

  useLayoutEffect(() => {
    const messages = messagesRef.current;
    if (following && messages) messages.scrollTop = messages.scrollHeight;
  }, [following, latestId]);

  function onScroll(event) {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= BOTTOM_TOLERANCE) {
      setReadingFrom(null);
    } else {
      setReadingFrom((previous) => previous ?? latestId);
    }
  }

  function jumpToLatest() {
    const messages = messagesRef.current;
    messages?.focus({ preventScroll: true });
    if (messages) messages.scrollTop = messages.scrollHeight;
    setReadingFrom(null);
  }

  return {
    viewportRef, messagesRef, onScroll, jumpToLatest, following,
    hasNewMessages: latestId != null && !following && readingFrom !== latestId,
  };
}
