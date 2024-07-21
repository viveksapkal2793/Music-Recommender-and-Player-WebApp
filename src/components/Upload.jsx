import React, { useState } from 'react';

const UploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('album', formData.album);
    data.append('file', formData.file);

    try {
      const response = await fetch('http://127.0.0.1:3000/upload', {
        method: 'POST',
        body: data,
      });
      if (response.ok) {
        alert('Song uploaded successfully!');
      } else {
        alert('Failed to upload song');
      }
    } catch (error) {
      console.error('Error uploading song:', error);
      alert('Failed to upload song');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl mb-4 font-bold text-center">Upload Song</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="artist">
            Artist
          </label>
          <input
            type="text"
            name="artist"
            id="artist"
            required
            value={formData.artist}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="album">
            Album
          </label>
          <input
            type="text"
            name="album"
            id="album"
            required
            value={formData.album}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            MP3 File
          </label>
          <input
            type="file"
            name="file"
            id="file"
            required
            accept="audio/mp3"
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
