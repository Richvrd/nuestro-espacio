import { COUPLE } from '@/lib/constants';

export default function MusicaPage() {
  return (
    <div className="page active">
      <div className="music-landing">
        <div className="music-vinyl">
          <div className="vinyl-disc">
            <div className="vinyl-label">
              <span className="vinyl-heart">♡</span>
              <span className="vinyl-initials">{COUPLE.name1[0]}&{COUPLE.name2[0]}</span>
              <span className="vinyl-heart">♡</span>
            </div>
          </div>
          <div className="vinyl-arm" />
        </div>
        <h2 className="music-title">Música</h2>
        <p className="music-sub">
          la banda sonora de nuestro amor<br />
          está por comenzar...
        </p>
        <div className="music-notes">
          <span>♪</span>
          <span>♫</span>
          <span>♬</span>
          <span>♩</span>
          <span>♪</span>
          <span>♫</span>
        </div>
      </div>
    </div>
  );
}
