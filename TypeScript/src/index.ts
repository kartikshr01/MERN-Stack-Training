function getFullName(firstName: string, lastName: string, middleName?: string): string {
    if (middleName) {
        return `${firstName} ${middleName} ${lastName}`;
    }
    return `${firstName} ${lastName}`;
}




const phone: string | null = "7986543221";
if (phone === null) {
    console.log("No phone");
} else {
    let phoneNumber = "";
    for (let i = 0; i < 5; i++) {
        phoneNumber += phone[i];
    }
    console.log({
        Phone: phoneNumber
    });
}




type Product = {
    id: number,
    title: string,
    price: number,
    inStock: boolean,
    discount?: number,
    deletedAt: Date | null,
}

const product1: Product = {
    id: 6356,
    title: "Kaisan Ba?",
    price: 500,
    inStock: true,
    deletedAt: null,
};

const product2: Product = {
    id: 468,
    title: "Halwa hai kya?",
    price: 4600,
    inStock: false,
    discount: 200,
    deletedAt: null,
};







// INTERFACE

interface interfaceProduct {
    id: string;
    title: string;
    price: number;
    description: string;
    category: string;
    inStock: boolean;
    createAt: Date;
}

type CreateProductDto = Omit<Product, 'id' | 'createdAt'>;

type UpdateProductDto = Partial<Omit<Product, 'id'>>;

type ProductPreview = Pick<Product, 'id' | 'title' | 'price'>;




interface Timestamps {
  createdAt: Date;
}

interface SoftDelete {
  isDeleted: boolean;
  deletedAt: Date | null;
}

interface both extends Timestamps,SoftDelete {}
interface user extends both{
    id:string,
    name:string,
    email:string
}
interface Products extends both{
 id:string,
 price:number,
stock:number
}

interface Order extends both {
  id: string;
  userId: string;       
  productIds: string[]; 
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
}
