import {Outlet,} from "react-router-dom";

export default function AuthLayout() {

    return (
        <>
            {(
                <>
                    <section className="flex flex-1 justify-center items-center flex-col py-10">
                        <Outlet/>
                    </section>

                    <img
                        src="/assets/images/side-img.jpg"
                        alt="logo"
                        className="hidden xl:block h-screen w-1/2 object-contain bg-no-repeat"
                    />
                </>
            )}
        </>
    );
}
