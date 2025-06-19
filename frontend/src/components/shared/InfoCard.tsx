export interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

// Simple styles for the page
const styles = {
  infoCard: {
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  },
  infoTitle: { fontSize: '18px', fontWeight: 'bold' },
  infoContent: { fontSize: '14px' },
};

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoTitle}>{title}</div>
      <div style={styles.infoContent}>{children}</div>
    </div>
  );
};

export default InfoCard;
export { InfoCard };
