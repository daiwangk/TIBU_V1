const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

let mockThreads = [
  {
    id: "thread-1",
    businessId: "sweet-crumbs",
    productId: "sweet-crumbs-chocolate-cake",
    customerId: "cust-1",
    updatedAt: new Date().toISOString(),
    unreadForCustomer: false,
    unreadForSeller: true,
    messages: [
      { id: "msg-1", sender: "customer", text: "Is this available for today?", createdAt: new Date(Date.now() - 3600000).toISOString() }
    ]
  }
];

export async function listEnquiries(customerId) {
  await delay(NETWORK_DELAY);
  return mockThreads.filter(t => t.customerId === customerId);
}

export async function getEnquiryThread(threadId) {
  await delay(NETWORK_DELAY);
  return mockThreads.find(t => t.id === threadId) ?? null;
}

export async function sendEnquiryMessage(threadId, message, sender = "customer") {
  await delay(NETWORK_DELAY);
  const thread = mockThreads.find(t => t.id === threadId);
  if (!thread) throw new Error("Thread not found");

  const newMessage = {
    id: `msg-${Date.now()}`,
    sender,
    text: message,
    createdAt: new Date().toISOString()
  };
  
  thread.messages.push(newMessage);
  thread.updatedAt = newMessage.createdAt;
  if (sender === "customer") thread.unreadForSeller = true;
  else thread.unreadForCustomer = true;

  return newMessage;
}
