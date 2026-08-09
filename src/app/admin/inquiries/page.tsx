import connectToDatabase from '@/lib/mongodb';
import { Inquiry } from '@/models/Inquiry';
import InquiriesClient, { type InquiryRecord } from './InquiriesClient';

export const metadata = {
  title: 'Inquiries | Admin Dashboard',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VALID_STATUSES = ['new', 'contacted', 'closed'] as const;
type InquiryStatus = (typeof VALID_STATUSES)[number];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = VALID_STATUSES.includes(status as InquiryStatus) ? (status as InquiryStatus) : 'all';

  await connectToDatabase();

  const filter = activeStatus !== 'all' ? { status: activeStatus } : {};
  const rawInquiries = await Inquiry.find(filter).sort({ createdAt: -1 }).lean();

  const inquiries = (JSON.parse(JSON.stringify(rawInquiries)) as InquiryRecord[]).map((inquiry) => ({
    ...inquiry,
    _id: String(inquiry._id),
  }));

  const [total, newCount, contactedCount, closedCount] = await Promise.all([
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),
    Inquiry.countDocuments({ status: 'contacted' }),
    Inquiry.countDocuments({ status: 'closed' }),
  ]);

  const stats = {
    total,
    new: newCount,
    contacted: contactedCount,
    closed: closedCount,
  };

  return <InquiriesClient inquiries={inquiries} activeStatus={activeStatus as 'all' | InquiryStatus} stats={stats} />;
}