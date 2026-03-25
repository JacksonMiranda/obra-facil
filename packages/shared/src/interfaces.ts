import type {
  ProfessionalWithProfile,
  Conversation,
  Message,
  MessageWithSender,
  MaterialList,
  MaterialItem,
  StoreOfferWithStore,
  Order,
  OrderWithStore,
  Work,
  WorkWithProfessional,
} from './types';

export interface IProfessionalsRepository {
  search(params: {
    query?: string;
    service?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<ProfessionalWithProfile[]>;
  findById(id: string): Promise<ProfessionalWithProfile | null>;
  findByClerkId(clerkId: string): Promise<ProfessionalWithProfile | null>;
}

export interface IConversationsRepository {
  findAllByProfile(profileId: string): Promise<Conversation[]>;
  findById(id: string): Promise<Conversation | null>;
  findOrCreate(params: { clientId: string; professionalId: string }): Promise<Conversation>;
}

export interface IMessagesRepository {
  findByConversation(conversationId: string, limit?: number): Promise<MessageWithSender[]>;
  create(params: {
    conversationId: string;
    senderId: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<Message>;
}

export interface IMaterialListsRepository {
  findAllByProfessional(professionalId: string): Promise<MaterialList[]>;
  findById(id: string): Promise<MaterialList | null>;
  create(params: { professionalId: string; conversationId: string }): Promise<MaterialList>;
  addItem(params: {
    materialListId: string;
    name: string;
    quantity: number;
    unit: string;
  }): Promise<MaterialItem>;
}

export interface IStoreOffersRepository {
  findBestOffers(materialListId: string): Promise<StoreOfferWithStore[]>;
  findByList(materialListId: string): Promise<StoreOfferWithStore[]>;
}

export interface IOrdersRepository {
  findAllByProfile(profileId: string): Promise<OrderWithStore[]>;
  findById(id: string): Promise<OrderWithStore | null>;
  create(params: {
    clientId: string;
    storeId: string;
    materialListId?: string;
    totalAmount: number;
    orderNumber: string;
  }): Promise<Order>;
}

export interface IWorksRepository {
  findAllByClient(clientId: string): Promise<WorkWithProfessional[]>;
  findAllByProfessional(professionalId: string): Promise<WorkWithProfessional[]>;
  findById(id: string): Promise<WorkWithProfessional | null>;
  updateProgress(id: string, progressPct: number): Promise<Work>;
}
