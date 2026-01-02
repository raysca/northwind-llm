import { X, Sparkles, ShoppingBag, Users, Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomePopupProps {
    isOpen: boolean;
    onDismiss: () => void;
}

export function WelcomePopup({ isOpen, onDismiss }: WelcomePopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onDismiss}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className={cn(
                            "relative w-full max-w-sm bg-card rounded-3xl border shadow-2xl overflow-hidden"
                        )}
                    >
                        {/* Decorative background gradient */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

                        {/* Close Button */}
                        <button
                            onClick={onDismiss}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>

                        <div className="relative px-6 pt-12 pb-6 flex flex-col items-center text-center">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 group"
                            >
                                <Sparkles className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
                            </motion.div>

                            <h2 className="text-xl font-bold text-foreground mb-2">
                                Northwind Assistant
                            </h2>
                            <p className="text-sm text-muted-foreground mb-8 text-balance">
                                I'm here to help you manage your store operations with real-time insights and actions.
                            </p>

                            {/* Capabilities Grid */}
                            <div className="w-full grid gap-3 mb-8">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/50 text-left hover:bg-muted transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-none">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Check Stock</p>
                                        <p className="text-xs text-muted-foreground">"How many Chai are left?"</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/50 text-left hover:bg-muted transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-none">
                                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Track Orders</p>
                                        <p className="text-xs text-muted-foreground">"Show recent orders from Berlin"</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/50 text-left hover:bg-muted transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-none">
                                        <Users className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Manage Team</p>
                                        <p className="text-xs text-muted-foreground">"Who reports to Andrew?"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={onDismiss}
                                className="w-full py-3.5 px-4 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
