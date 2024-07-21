import React, { useEffect, useState } from 'react';

const AlbumCard = () => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {albums.map((album) => (
        <div key={album._id} className="bg-white border rounded-lg shadow-md overflow-hidden">
          <img
            src={`http://localhost:3000/covers/${album.coverImage}`}
            alt={`${album.title} cover`}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{album.title}</h2>
            <p className="text-gray-600 mb-2">{album.description}</p>
            <p className="text-gray-500">Artist: {album.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumCard;
