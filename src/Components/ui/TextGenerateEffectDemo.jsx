import React from "react";
import { TextGenerateEffect } from "./text-generate-effect";

const words = `“Daj čoveku kolač, zasladićeš mu dan. Nauči ga da pravi kolače i zasladićeš mu ceo život.”`;

export function TextGenerateEffectDemo() {
    return <TextGenerateEffect duration={2} filter={false} words={words} />;
}
