import { useState } from "react";
import axios from "axios";

const CreatePoll = () => {
  const token = localStorage.getItem("token");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // start with 2 empty options

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("Question is required!");
      return;
    }
    if (options.length < 2 || options.some(opt => !opt.trim())) {
      alert("At least 2 valid options are required!");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/poll/createpoll`,
        { question, options },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Poll created successfully!");
      setQuestion("");
      setOptions(["", ""]);
      window.location.href = "/"; 

    } catch (e) {
      console.log("error during create poll-", e.response?.data || e.message);
      alert("Failed to create poll");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create a Poll</h2>

      <input
        type="text"
        placeholder="Enter your question"
        className="w-full border px-3 py-2 rounded mb-4"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <div className="space-y-2 mb-4">
        {options.map((opt, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Option ${idx + 1}`}
              className="flex-1 border px-3 py-2 rounded"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
            />
            {options.length > 2 && (
              <button
                className="text-red-500 px-2 py-1"
                onClick={() => removeOption(idx)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 4 && (
        <button
          className="mb-4 bg-gray-200 px-3 py-1 rounded"
          onClick={addOption}
        >
          + Add Option
        </button>
      )}

      <div>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded"
          onClick={handleSubmit}
        >
          Create Poll
        </button>
      </div>
    </div>
  );
};

export default CreatePoll;
