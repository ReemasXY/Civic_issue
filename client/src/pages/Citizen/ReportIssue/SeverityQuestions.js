const QUESTIONS = {
  "Garbage / Waste": [
    {
      question: "How much waste is present?",
      options: [
        { label: "Small amount", score: 1 },
        { label: "Moderate amount", score: 2 },
        { label: "Large amount", score: 3 },
        { label: "Massive pile", score: 4 },
      ],
    },
    {
      question: "Does it block roads or pathways?",
      options: [
        { label: "No", score: 0 },
        { label: "Partially", score: 2 },
        { label: "Mostly", score: 3 },
        { label: "Completely", score: 4 },
      ],
    },
    {
      question: "Is there a bad smell?",
      options: [
        { label: "No", score: 0 },
        { label: "Mild", score: 1 },
        { label: "Moderate", score: 2 },
        { label: "Severe", score: 4 },
      ],
    },
    {
      question: "Does it attract pests?",
      options: [
        { label: "No", score: 0 },
        { label: "Occasionally", score: 1 },
        { label: "Frequently", score: 2 },
        { label: "Severely", score: 4 },
      ],
    },
    {
      question: "How long has the waste been there?",
      options: [
        { label: "Less than a day", score: 1 },
        { label: "1–3 days", score: 2 },
        { label: "4–7 days", score: 3 },
        { label: "More than a week", score: 4 },
      ],
    },
  ],

  "Streetlight Damage": [
    {
      question: "How severe is the streetlight damage?",
      options: [
        { label: "Minor (dim or flickering)", score: 1 },
        { label: "Moderate (not working)", score: 2 },
        { label: "Severe (broken or leaning pole)", score: 3 },
        { label: "Critical (fallen or about to fall)", score: 4 },
      ],
    },
    {
      question: "Is there any electrical hazard?",
      options: [
        { label: "No", score: 0 },
        { label: "Not sure", score: 1 },
        { label: "Exposed or hanging wires", score: 3 },
        { label: "Sparking or live wires", score: 4 },
      ],
    },
    {
      question: "How much does it affect visibility at night?",
      options: [
        { label: "Not at all", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Severely (area is dark)", score: 4 },
      ],
    },
    {
      question: "How many streetlights are affected?",
      options: [
        { label: "One light", score: 1 },
        { label: "2–3 lights", score: 2 },
        { label: "Several lights on the street", score: 3 },
        { label: "The whole street or area", score: 4 },
      ],
    },
    {
      question: "How long has the problem existed?",
      options: [
        { label: "Less than a day", score: 1 },
        { label: "1–3 days", score: 2 },
        { label: "4–7 days", score: 3 },
        { label: "More than a week", score: 4 },
      ],
    },
  ],

  Drainage: [
    {
      question: "How severe is the drainage blockage?",
      options: [
        { label: "Minor", score: 1 },
        { label: "Moderate", score: 2 },
        { label: "Severe", score: 3 },
        { label: "Completely blocked", score: 4 },
      ],
    },
    {
      question: "Is water accumulating?",
      options: [
        { label: "No", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Severely", score: 4 },
      ],
    },
    {
      question: "Does it affect traffic or pedestrians?",
      options: [
        { label: "No", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Severely", score: 4 },
      ],
    },
    {
      question: "Is there a foul smell?",
      options: [
        { label: "No", score: 0 },
        { label: "Mild", score: 1 },
        { label: "Moderate", score: 2 },
        { label: "Severe", score: 4 },
      ],
    },
    {
      question: "How long has the drainage issue existed?",
      options: [
        { label: "Less than a day", score: 1 },
        { label: "1–3 days", score: 2 },
        { label: "4–7 days", score: 3 },
        { label: "More than a week", score: 4 },
      ],
    },
  ],

  "Road Damage": [
    {
      question: "How severe is the road damage?",
      options: [
        { label: "Minor", score: 1 },
        { label: "Moderate", score: 2 },
        { label: "Severe", score: 3 },
        { label: "Critical", score: 4 },
      ],
    },
    {
      question: "Does it affect traffic?",
      options: [
        { label: "No", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Severely", score: 4 },
      ],
    },
    {
      question: "Does it pose a safety risk?",
      options: [
        { label: "No", score: 0 },
        { label: "Low Risk", score: 1 },
        { label: "Medium Risk", score: 2 },
        { label: "High Risk", score: 4 },
      ],
    },
    {
      question: "How large is the damaged area?",
      options: [
        { label: "Small", score: 1 },
        { label: "Medium", score: 2 },
        { label: "Large", score: 3 },
        { label: "Very Large", score: 4 },
      ],
    },
    {
      question: "Is the damage getting worse?",
      options: [
        { label: "No", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Rapidly", score: 4 },
      ],
    },
  ],
};

export default QUESTIONS;