import ProductInfo from "./ProductInfo";
import ProductActions from "./ProductActions";

export default function ProductCard() {
    return (
        <div className="card h-100 shadow-sm">
            <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi_0emP7ZUgoNXMPHaKiFNGoS21lO2bh9l1g&s" alt="Caneca dev" className="card-img-top"
            />
            <div className="card-body d-flex flex-column">
                <ProductInfo />
                <div className="mt-auto d-flex justify-content-end">
                    <ProductActions />
                </div>
            </div>
        </div>
    );
}
