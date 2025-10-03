import axios from "axios";
import { useEffect, useState } from "react";

const Home = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [polls, setPolls] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [selectedOptions, setSelectedOptions] = useState({}); 
  const [votedPolls, setVotedPolls] = useState(new Set()); 

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "VOTE_UPDATE") {
        setPolls(prev =>
          prev.map(p =>
            p.id === data.pollId
              ? { ...p, options: p.options.map(o => {
                  const updated = data.optionCounts.find(x => x.optionId === o.id);
                  return updated ? { ...o, votes: Array(updated.count).fill({}) } : o;
                })}
              : p
          )
        );
      }
    };

    return () => ws.close();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/poll/getpolls`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedPolls = response.data.polls;

      const preselected = {};
      const voted = new Set();
      fetchedPolls.forEach(poll => {
        poll.options.forEach(option => {
          const userVote = option.votes.find(vote => vote.userId === user?.id);
          if (userVote) {
            preselected[poll.id] = option.id;
            voted.add(poll.id); 
          }
        });
      });

      setPolls(fetchedPolls);
      setSelectedOptions(preselected);
      setVotedPolls(voted);
    } catch (e) {
      console.log("error during fetch polls-", e.response?.data || e.message);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleSelect = (pollId, optionId) => {
    if (votedPolls.has(pollId)) return;
    setSelectedOptions(prev => ({ ...prev, [pollId]: optionId }));
  };

  const handleSubmit = async (pollId) => {
    const selectedOptionId = selectedOptions[pollId];
    if (!selectedOptionId) {
      alert("Please select an option!");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/vote/votesubmit`,
        { optionId: selectedOptionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPolls(); 
    } catch (e) {
      console.log("error during vote-", e.response?.data || e.message);
    }
  };

  const filteredPolls = polls.filter(poll => filter === 'my' ? poll.creatorId === user?.id : true);

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setFilter('all')}
        >
          All Polls
        </button>

        <button 
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => setFilter('my')}
        >
          My Polls
        </button>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => window.location.href='/createpoll'}
        >
          Create a Poll
        </button>
      </div>

      {/* Poll render section */}
      <div className="grid gap-4">
        {filteredPolls.length === 0 ? (
          <p>No polls found.</p>
        ) : (
          filteredPolls.map(poll => {
            const userAlreadyVoted = votedPolls.has(poll.id);

            return (
              <div key={poll.id} className="border p-4 rounded shadow-sm">
                <h3 className="font-semibold text-lg mb-4">{poll.question}</h3>

                {/* Options */}
                <div className="flex flex-col gap-2">
                  {poll.options.map(option => {
                    const isSelected = selectedOptions[poll.id] === option.id;
                    const count = option.votes ? option.votes.length : 0; // fallback for WS updates

                    return (
                        <div
                        key={option.id}
                        className="flex items-center justify-between cursor-pointer p-2 border rounded"
                        onClick={() => handleSelect(poll.id, option.id)}
                        >
                        {/* Left side: radio + option text */}
                        <div className="flex items-center gap-2">
                            <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}
                            >
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <span>{option.text}</span>
                        </div>

                        {/* Right side: live vote count */}
                        <span className="text-gray-600 font-medium">{count}</span>
                        </div>
                    );
                    })}
                </div>

                {userAlreadyVoted ? (
                  <p className="mt-4 text-green-600 font-semibold">You already voted</p>
                ) : (
                  <button
                    className="mt-4 bg-purple-500 text-white px-4 py-2 rounded"
                    onClick={() => handleSubmit(poll.id)}
                  >
                    Submit
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;