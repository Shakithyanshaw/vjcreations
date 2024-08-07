import Spinner from 'react-bootstrap/Spinner';

// Component to display a loading spinner
export default function LoadingBox() {
  return (
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
