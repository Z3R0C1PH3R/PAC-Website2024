// @ts-ignore

import ExeData from '../../TeamsInfo/ExeData.js'
//@ts-ignore

import CoordiData from '../../TeamsInfo/CoordiData.js'

export function Teams() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Team</h1>

      {/* Coordinator Members */}
      <h2 style={styles.sectionTitle}>Coordinators</h2>
      <div style={styles.cardContainer}>
        {
        //@ts-ignore
        CoordiData.map((member, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.imageContainer}>
              <img src={member.img ? member.img : null} alt={member.Name} style={styles.cardImage} />
              <div style={styles.glow} />
            </div>
            <h3 style={styles.name}>{member.Name}</h3>
            <p style={styles.detail}><strong>Rank:</strong> {member.Position}</p>
            <p style={styles.detail}><strong>Division:</strong> {member.Domain}</p>
            <p style={styles.detail}><strong>Expertise:</strong> {member.Field}</p>
            <p style={styles.detail}><strong>Comms:</strong> {member.Email}</p>
          </div>
        ))}
      </div>

      {/* Executive Members */}
      <h2 style={styles.sectionTitle}>Executives</h2>
      <div style={styles.cardContainer}>
        {
        //@ts-ignore
        ExeData.map((member, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.imageContainer}>
              <img src={member.img ? member.img : null} alt={member.Name} style={styles.cardImage} />
              <div style={styles.glow} />
            </div>
            <h3 style={styles.name}>{member.Name}</h3>
            <p style={styles.detail}><strong>Rank:</strong> {member.Position}</p>
            <p style={styles.detail}><strong>Division:</strong> {member.Domain}</p>
            <p style={styles.detail}><strong>Expertise:</strong> {member.Field}</p>
            <p style={styles.detail}><strong>Comms:</strong> {member.Email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: {[key: string]: React.CSSProperties} = {
  container: {
    background: '#0a1128',
    minHeight: '100vh',
    padding: '2rem',
    color: '#fff'
  },
  title: {
    marginTop:50,
    color: '#60A5FA',
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '3rem'
  },
  sectionTitle: {
    color: '#C4B5FD',
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '2rem'
  },
  cardContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: '2rem',
    marginBottom: '4rem'
  },
  card: {
    background: '#1E293B',
    borderRadius: '10px',
    width: '250px',
    padding: '1rem',
    textAlign: 'center',
    boxSizing: 'border-box',
    border: '1px solid rgba(147, 197, 253, 0.3)',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: '1rem',
    width:'90%',
    height:200,
    overflow:'hidden'
  },
  cardImage: {
    width: '100%',
    borderRadius: '8px',
    height: 'auto',
    position: 'relative',
    zIndex: 1
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(96, 165, 250, 0.2)',
    borderRadius: '8px',
    filter: 'blur(4px)',
    zIndex: 0
  },
  name: {
    color: '#93C5FD',
    fontSize: '1.25rem',
    marginBottom: '0.5rem'
  },
  detail: {
    color: '#E2E8F0',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  }
};