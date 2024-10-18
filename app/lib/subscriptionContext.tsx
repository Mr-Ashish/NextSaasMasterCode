// subscription-context.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getUserSubscriptionsAction } from '@/app/lib/authActions';

// Create context
const SubscriptionContext = createContext(null);

// Custom hook to use the context
export function useSubscription() {
  return useContext(SubscriptionContext);
}

// Subscription Provider component
export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscription, setSubscription] = useState(null);

  const fetchSubscriptionIfAny = async () => {
    const userSubscriptions = await getUserSubscriptionsAction();
    if (userSubscriptions.success) {
      setSubscription(userSubscriptions.subscription);
    }
  };

  useEffect(() => {
    fetchSubscriptionIfAny();
  }, []);

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}
