const Button = ({ onClick, loading }) => (
  <button onClick={onClick} disabled={loading}>
    {loading ? 'Loading...' : 'Fetch Site'}
  </button>
);

export default Button;
