import React, {useEffect, useState} from 'react';

export default function Document(props) {
    let [content, setContent] = useState(props.content);
    
    return (
        <div className="Document">
            {content}
        </div>
    );
}