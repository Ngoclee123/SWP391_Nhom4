import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = ({ parentId, doctorId, articleId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/feedbacks', {
      parent: parentId ? { id: parentId } : null,
      doctor: doctorId ? { id: doctorId } : null,
      articleId: articleId || null,
      rating,
      comment
    });
    setSuccess(true);
    setComment('');
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: 400, margin: '0 auto'}}>
      <h3>Gửi Feedback</h3>
      <div>
        <label>Rating: </label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div>
        <label>Nội dung:</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} required rows={4} style={{width: '100%'}} />
      </div>
      <button type="submit">Gửi</button>
      {success && <div style={{color: 'green'}}>Gửi feedback thành công!</div>}
    </form>
  );
};

export default FeedbackForm; 