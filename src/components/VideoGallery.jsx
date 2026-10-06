import { useState } from 'react';

/** Shows YouTube thumbnails; the iframe only loads when the visitor clicks play. */
function VideoTile({ video }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="video-tile">
      <div className="video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play ${video.title}`}>
            <img src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="video-play">▶</span>
          </button>
        )}
      </div>
      <figcaption>
        <strong>{video.title}</strong>
        {video.description && <p className="muted">{video.description}</p>}
      </figcaption>
    </figure>
  );
}

export default function VideoGallery({ title = 'Watch', videos }) {
  if (!videos?.length) return null;
  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoTile key={v._id} video={v} />
        ))}
      </div>
    </section>
  );
}
