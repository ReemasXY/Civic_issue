const QUESTIONS = {
  Pothole: [
    {
      question: "How large is the pothole?",
      options: [
        { label: "Small", score: 1 },
        { label: "Medium", score: 2 },
        { label: "Large", score: 3 },
        { label: "Very Large", score: 4 },
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
      question: "How long has the pothole existed?",
      options: [
        { label: "Less than a week", score: 1 },
        { label: "1–4 weeks", score: 2 },
        { label: "1–3 months", score: 3 },
        { label: "More than 3 months", score: 4 },
      ],
    },
    {
      question: "Is it getting worse?",
      options: [
        { label: "No", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Rapidly", score: 4 },
      ],
    },
  ],

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

  "Water Supply": [
    {
      question: "How severe is the water supply problem?",
      options: [
        { label: "Minor", score: 1 },
        { label: "Moderate", score: 2 },
        { label: "Severe", score: 3 },
        { label: "Critical", score: 4 },
      ],
    },
    {
      question: "How many people are affected?",
      options: [
        { label: "Few people", score: 1 },
        { label: "Several households", score: 2 },
        { label: "Many households", score: 3 },
        { label: "Large community", score: 4 },
      ],
    },
    {
      question: "Is there no water supply?",
      options: [
        { label: "No", score: 0 },
        { label: "Occasionally", score: 1 },
        { label: "Frequently", score: 2 },
        { label: "Completely unavailable", score: 4 },
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
    {
      question: "Is the issue getting worse?",
      options: [
        { label: "No", score: 0 },
        { label: "Slightly", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "Rapidly", score: 4 },
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