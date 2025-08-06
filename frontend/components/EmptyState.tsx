'use client';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 sm:py-12 ${className}`}>
      {icon && (
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
} 