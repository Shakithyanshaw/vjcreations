import Alert from 'react-bootstrap/Alert';

// Component to display an alert message
export default function MessageBox(props) {
  return <Alert variant={props.variant || 'info'}>{props.children}</Alert>;
}
