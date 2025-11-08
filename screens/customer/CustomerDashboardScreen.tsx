import React from 'react';
import { useAuth, useAuthMutations } from '../../auth';
import { StarIcon, CheckIcon } from '../../components/Icons';
import { LoyaltyTier, Reward } from '../../types';
import { notificationService } from '../../services/notificationService';
import AiRecommendations from '../../components/AiRecommendations';

const TIER_CONFIG: Record<LoyaltyTier, { name: string; color: string; bg: string; text: string; nextTierPoints: number | null }> = {
    'None': { name: 'New Member', color: 'bg-gray-500', bg: 'bg-gray-700', text: 'text-gray-200', nextTierPoints: 1 },
    'Bronze': { name: 'Bronze', color: 'bg-yellow-600', bg: 'bg-yellow-900/50', text: 'text-yellow-300', nextTierPoints: 50 },
    'Silver': { name: 'Silver', color: 'bg-gray-400', bg: 'bg-gray-700', text: 'text-gray-200', nextTierPoints: 100 },
    'Gold': { name: 'Gold', color: 'bg-yellow-400', bg: 'bg-yellow-800/50', text: 'text-yellow-300', nextTierPoints: null },
};

const LoyaltyProgressBar: React.FC<{ points: number; tier: LoyaltyTier }> = ({ points, tier }) => {
    const config = TIER_CONFIG[tier];
    if (!config.nextTierPoints) {
        return <p className="text-sm text-yellow-400 font-semibold">You've reached the highest tier!</p>;
    }

    const prevTierPoints = tier === 'Bronze' ? 0 : (tier === 'Silver' ? TIER_CONFIG['Bronze'].nextTierPoints : TIER_CONFIG['Silver'].nextTierPoints) || 0;
    const progress = (points - prevTierPoints) / (config.nextTierPoints - prevTierPoints) * 100;

    return (
        <div>
            <div className="flex justify-between text-sm font-medium mb-1 text-gray-400">
                <span>{config.name}</span>
                <span>{points} / {config.nextTierPoints} pts</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${config.color} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
                {config.nextTierPoints - points} points until next tier!
            </p>
        </div>
    );
};

const RewardCard: React.FC<{ reward: Reward }> = ({ reward }) => {
    const { claimReward } = useAuthMutations();
    const { currentUser } = useAuth();

    const handleClaim = () => {
        if (currentUser) {
            claimReward(reward.id, currentUser);
            notificationService.notify({
                title: 'Reward Claimed!',
                message: 'This reward can now be used on your next order.',
                type: 'success'
            });
        }
    };

    return (
        <div className={`p-4 rounded-lg flex items-center justify-between ${reward.isClaimed ? 'bg-green-900/50' : 'bg-amber-900/50'}`}>
            <p className={`font-semibold ${reward.isClaimed ? 'text-green-300' : 'text-amber-300'}`}>{reward.description}</p>
            {reward.isClaimed ? (
                <span className="flex items-center text-sm font-bold text-green-400">
                    <CheckIcon className="w-5 h-5 mr-1"/> Claimed
                </span>
            ) : (
                <button onClick={handleClaim} className="px-3 py-1 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700">Claim</button>
            )}
        </div>
    );
};

const CustomerDashboardScreen: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;
    
    const { loyaltyPoints = 0, loyaltyTier = 'None', rewards = [] } = currentUser;
    const tierConfig = TIER_CONFIG[loyaltyTier];

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-gray-100">
                Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-400 mt-1">Here's your personal dashboard.</p>
            
            <div className="mt-8">
                <AiRecommendations />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gray-800 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Loyalty Status</h2>
                    <div className={`p-4 rounded-xl flex items-center space-x-4 ${tierConfig.bg}`}>
                        <StarIcon className={`w-12 h-12 ${tierConfig.text}`} />
                        <div>
                            <p className={`text-4xl font-bold ${tierConfig.text}`}>{loyaltyPoints}</p>
                            <p className={`font-semibold ${tierConfig.text}`}>{tierConfig.name} Tier Member</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <LoyaltyProgressBar points={loyaltyPoints} tier={loyaltyTier} />
                    </div>
                </div>
                 <div className="p-6 bg-gray-800 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">My Rewards</h2>
                    <div className="space-y-3">
                        {rewards.length > 0 ? rewards.map(reward => (
                            <RewardCard key={reward.id} reward={reward} />
                        )) : (
                            <p className="text-center text-gray-500 pt-8">No rewards yet. Keep ordering to earn them!</p>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default CustomerDashboardScreen;