import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('ai_knowledge')
export class AiKnowledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  // Embedding vector cho Gemini (768 chiều)
  @Column({
    type: 'vector',
    length: 768,
    nullable: true
  })
  embedding: number[];

  @CreateDateColumn()
  createdAt: Date;
}
