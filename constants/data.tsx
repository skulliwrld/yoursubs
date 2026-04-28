import { icons } from "./icons";
import type { AppTab, Subscription, UpcomingSubscription } from "./types";
import { loadSubscriptions } from "../utils/storage";

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "insights", title: "Insights", icon: icons.activity },
    { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
    name: "Adrian | JS Mastery",
};

export const HOME_BALANCE = {
    amount: 2489.48,
    nextRenewalDate: "2026-03-18T09:00:00.000Z",
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
    
];

export const getHomeSubscriptions = async (): Promise<Subscription[]> => {
    try {
        return await loadSubscriptions();
    } catch (error) {
        console.error('Error loading subscriptions:', error);
        return [];
    }
};
