import React from "react";
import { TextGenerateEffect } from "../Components/ui/text-generate-effect";

const words = `Oxygen gets you high. In a catastrophic emergency, we're taking giant, panicked breaths. Suddenly you become euphoric, docile. You accept your fate. It's all right here. Emergency water landing, six hundred miles an hour.`;

export function TextGenerateEffectDemo() {
    return <TextGenerateEffect duration={2} filter={false} words={words} />;
}
