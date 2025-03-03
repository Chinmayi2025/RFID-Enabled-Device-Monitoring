'use client';

import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import { Star } from 'lucide-react';

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  timestamp: string;
}

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedbackList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFeedback),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Reset form and refresh feedback list
      setNewFeedback({ rating: 5, comment: '' });
      fetchFeedback();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  const columns = [
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (info: any) => (
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < info.getValue()
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      header: 'Comment',
      accessorKey: 'comment',
    },
    {
      header: 'Date',
      accessorKey: 'timestamp',
      cell: (info: any) => new Date(info.getValue()).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">User Feedback</h1>
        <p className="text-gray-500">View and submit user feedback</p>
      </div>

      {/* Feedback Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-medium mb-4">Submit New Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewFeedback(prev => ({ ...prev, rating }))}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= newFeedback.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={newFeedback.comment}
              onChange={(e) =>
                setNewFeedback(prev => ({ ...prev, comment: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Feedback
          </button>
        </form>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Recent Feedback</h2>
        </div>
        {error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : (
          <DataTable columns={columns} data={feedbackList} />
        )}
      </div>
    </div>
  );
}
