import React from 'react'
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn }) => {
  console.log(message)
  const date = new Date(message.timeStamp);
  const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
  return (
    <div className={`p-2 my-1 rounded-xl max-w-xs ${isOwn ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 self-start'}`}>
      {(isOwn ? <p>{message.content}</p> : <p>{message.content}</p>)}
      <small className="text-xs opacity-70">{formattedDate}</small>
    </div>
  )
}

export default MessageBubble