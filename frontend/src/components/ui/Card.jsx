const Card = ({ children, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'card',
    floating: 'floating-card',
    gradient: 'gradient-card',
    glass: 'glass-effect rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1'
  };

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;