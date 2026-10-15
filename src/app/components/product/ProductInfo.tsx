import Link from "next/link";
export default function ProductInfo() {
    return (
        <>
            <h5 className="card-title mb-1">
                <Link href={``} className="text-decoration-none">
                    Caneca Dev
                </Link>
            </h5>
            <p className="card-text text-muted small mb-2">Caneca para café, ideal
                para programar</p>
            <p className="fw-bold text-primary mb-0">R$ 39,90</p>
        </>
    );
}
