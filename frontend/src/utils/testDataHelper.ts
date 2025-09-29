/**
 * Test Data Helper
 * Temporary utility to create sample documents for testing
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../services/firebase';

// Create sample documents for testing
export const createSampleDocuments = async (userId: string) => {
  const sampleDocuments = [
    {
      id: 'sample-doc-1',
      title: 'Guide clinique de prise en charge de l\'AVC',
      description: 'Guide complet pour la prise en charge des patients victimes d\'AVC en phase aiguë.',
      summary: 'Protocoles de soins pour AVC aigu',
      category: 'clinical-guidelines',
      tags: ['AVC', 'urgence', 'protocole', 'soins'],
      keywords: ['stroke', 'emergency', 'clinical', 'guidelines'],
      priority: 'high',
      fileName: 'guide-avc-aigu.pdf',
      fileSize: 2048576, // 2MB
      fileType: 'application/pdf',
      downloadURL: 'https://example.com/guide-avc-aigu.pdf', // Mock URL
      storagePath: 'documents/clinical-guidelines/sample-doc-1/1/guide-avc-aigu.pdf',
      language: 'fr',
      medicalSpecialty: ['neurologie', 'urgences'],
      targetAudience: ['specialist', 'attendee'],
      difficultyLevel: 'intermediate',
      cmeCredits: 2,
      access: {
        isPublic: true,
        allowedRoles: ['attendee', 'specialist', 'admin', 'stakeholder'],
        requiresApproval: false,
      },
      version: 1,
      status: 'approved',
      createdBy: userId,
      createdAt: serverTimestamp(),
      metadata: {
        createdAt: serverTimestamp(),
        viewCount: 15,
        downloadCount: 8,
        rating: 4.5,
        ratingCount: 3,
      },
    },
    {
      id: 'sample-doc-2',
      title: 'Cas clinique: AVC ischémique chez un jeune adulte',
      description: 'Étude de cas détaillée d\'un patient de 35 ans présentant un AVC ischémique.',
      summary: 'Cas clinique AVC jeune adulte',
      category: 'case-studies',
      tags: ['cas clinique', 'jeune adulte', 'ischémique'],
      keywords: ['case study', 'young adult', 'ischemic', 'stroke'],
      priority: 'normal',
      fileName: 'cas-avc-jeune-adulte.pdf',
      fileSize: 1536000, // 1.5MB
      fileType: 'application/pdf',
      downloadURL: 'https://example.com/cas-avc-jeune-adulte.pdf',
      storagePath: 'documents/case-studies/sample-doc-2/1/cas-avc-jeune-adulte.pdf',
      language: 'fr',
      medicalSpecialty: ['neurologie'],
      targetAudience: ['specialist', 'attendee'],
      difficultyLevel: 'advanced',
      cmeCredits: 1,
      access: {
        isPublic: true,
        allowedRoles: ['attendee', 'specialist', 'admin', 'stakeholder'],
        requiresApproval: false,
      },
      version: 1,
      status: 'approved',
      createdBy: userId,
      createdAt: serverTimestamp(),
      metadata: {
        createdAt: serverTimestamp(),
        viewCount: 23,
        downloadCount: 12,
        rating: 4.8,
        ratingCount: 5,
      },
    },
    {
      id: 'sample-doc-3',
      title: 'Formation: Techniques de rééducation post-AVC',
      description: 'Matériel de formation sur les techniques de rééducation pour patients post-AVC.',
      summary: 'Formation rééducation post-AVC',
      category: 'training-materials',
      tags: ['formation', 'rééducation', 'kinésithérapie'],
      keywords: ['training', 'rehabilitation', 'physiotherapy', 'recovery'],
      priority: 'normal',
      fileName: 'formation-reeducation-post-avc.pdf',
      fileSize: 3072000, // 3MB
      fileType: 'application/pdf',
      downloadURL: 'https://example.com/formation-reeducation-post-avc.pdf',
      storagePath: 'documents/training-materials/sample-doc-3/1/formation-reeducation-post-avc.pdf',
      language: 'fr',
      medicalSpecialty: ['kinésithérapie', 'neurologie'],
      targetAudience: ['specialist', 'attendee'],
      difficultyLevel: 'beginner',
      cmeCredits: 3,
      access: {
        isPublic: true,
        allowedRoles: ['attendee', 'specialist', 'admin', 'stakeholder'],
        requiresApproval: false,
      },
      version: 1,
      status: 'approved',
      createdBy: userId,
      createdAt: serverTimestamp(),
      metadata: {
        createdAt: serverTimestamp(),
        viewCount: 45,
        downloadCount: 28,
        rating: 4.2,
        ratingCount: 8,
      },
    },
  ];

  try {
    console.log('🔄 Creating sample documents...');
    
    for (const docData of sampleDocuments) {
      const docRef = doc(firestore, 'documents', docData.id);
      await setDoc(docRef, docData);
      console.log(`✅ Created sample document: ${docData.title}`);
    }
    
    console.log('🎉 All sample documents created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating sample documents:', error);
    throw error;
  }
};

// Remove sample documents (cleanup)
export const removeSampleDocuments = async () => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    
    const sampleIds = ['sample-doc-1', 'sample-doc-2', 'sample-doc-3'];
    
    for (const docId of sampleIds) {
      const docRef = doc(firestore, 'documents', docId);
      await deleteDoc(docRef);
      console.log(`🗑️ Removed sample document: ${docId}`);
    }
    
    console.log('🧹 Sample documents cleanup completed');
    return true;
  } catch (error) {
    console.error('❌ Error removing sample documents:', error);
    throw error;
  }
};