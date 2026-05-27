import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FieldCard from './FieldCard';
import { useEffect, useState } from 'react';
import { getAllFields } from '../config/FieldRequest';

function FeaturedFields() {
    const [dataField, setDataField] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getAllFields();
            setDataField(res.metadata);
        };
        fetchData();
    }, []);

    return (
        <section className="py-16 lg:py-20 bg-gray-50">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Sân nổi bật</h2>
                        <p className="mt-2 text-gray-500">Những sân được đặt nhiều nhất tuần này</p>
                    </div>
                    <Link
                        to="/fields"
                        className="inline-flex items-center gap-2 text-[#16A34A] font-semibold hover:gap-3 transition-all duration-200"
                    >
                        Xem tất cả
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dataField?.fields?.map((field) => (
                        <FieldCard
                            key={field._id}
                            id={field._id}
                            name={field.name}
                            image={field.images}
                            address={field.address}
                            fieldType={field.type}
                            price={field.price}
                            rating={field.rating}
                            reviewCount={field.reviewCount}
                        />
                    ))}
                </div>

                {/* View More Button (Mobile) */}
                <div className="mt-10 text-center lg:hidden">
                    <Link
                        to="/danh-sach-san"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 
                                 text-gray-700 font-semibold rounded-xl shadow-sm
                                 hover:border-[#16A34A] hover:text-[#16A34A] transition-all duration-200"
                    >
                        Xem thêm sân
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default FeaturedFields;
