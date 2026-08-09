import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import cloudinary, { extractPublicId } from '@/lib/cloudinary';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await connectToDatabase();

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin project by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await connectToDatabase();
    
    const body = await request.json();
    
    // We fetch the project first to properly trigger Mongoose hooks (like the pre-validate hook for slug)
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Track old media URLs to delete if they change
    const oldHeroMediaUrl = project.heroMediaUrl;
    const oldFullPageMockupUrl = project.fullPageMockupUrl;

    // Update fields
    Object.assign(project, body);
    
    // Save to trigger hooks and validations
    const updatedProject = await project.save();

    // Clean up replaced images from Cloudinary asynchronously
    try {
      if (oldHeroMediaUrl && oldHeroMediaUrl !== updatedProject.heroMediaUrl) {
        const publicId = extractPublicId(oldHeroMediaUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      if (oldFullPageMockupUrl && oldFullPageMockupUrl !== updatedProject.fullPageMockupUrl) {
        const publicId = extractPublicId(oldFullPageMockupUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    } catch (cleanupError) {
      console.error('Failed to clean up old images from Cloudinary during PUT:', cleanupError);
    }

    return NextResponse.json({ success: true, data: updatedProject }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ success: false, error: messages.join(', ') }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'A project with this title/slug already exists' }, { status: 400 });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await connectToDatabase();

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Attempt to delete associated files from Cloudinary
    try {
      if (deletedProject.heroMediaUrl) {
        const publicId = extractPublicId(deletedProject.heroMediaUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      if (deletedProject.fullPageMockupUrl) {
        const publicId = extractPublicId(deletedProject.fullPageMockupUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    } catch (cleanupError) {
      console.error('Failed to clean up images from Cloudinary, continuing anyway:', cleanupError);
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
