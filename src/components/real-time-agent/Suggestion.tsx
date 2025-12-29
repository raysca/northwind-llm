"use client";

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

const suggestions = [
    "Give me the details of Tofu",
    "What is the price of Tofu?",
    "Who ordered recently?",
    "Who are our top 5 customers?",
];

const SuggestionList = ({ onSelect }: { onSelect: (suggestion: string) => void }) => {
    const handleSuggestionClick = (suggestion: string) => {
        onSelect(suggestion);
    };

    return (
        <Suggestions>
            {suggestions.map((suggestion) => (
                <Suggestion
                    key={suggestion}
                    onClick={handleSuggestionClick}
                    suggestion={suggestion}
                />
            ))}
        </Suggestions>
    );
};

export default SuggestionList;
