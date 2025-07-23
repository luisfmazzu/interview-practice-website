import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui';

const SelectionPage = dynamic(() => import('@/components/pages/SelectionPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <SelectionPage />;
}