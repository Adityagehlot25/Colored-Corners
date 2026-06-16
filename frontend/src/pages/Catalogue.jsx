// -------NOTE THAT THIS IS A DUMMY FRONTEND PAGE TO CHECK THE CATALOGUE------------

import { useState, useEffect } from 'react';
import axios from 'axios';

const Catalogue = () => {
    const [items, setItems] = useState([]);
    console.log(items);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get('http://localhost:8080/products');
                setItems(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchItems();
    }, []);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
            {items.map((i) => (
                <div key={i.id} style={{ border: '1px solid #ccc', padding: '10px', width: '250px' }}>
                    <img src={i.imgs[0]} alt={i.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <h3>{i.name}</h3>
                    <p>₹{i.price}</p>
                </div>
            ))}
        </div>
    );
};

export default Catalogue;