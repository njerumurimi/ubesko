import { Button } from "../../../components/ui/button"
import { Link } from "react-router-dom"

export function AuthSection() {
    return (
        <>
            <h2 className="text-[22px] font-semibold">Log in or sign up to book</h2>

            <div className="pt-10">
                <div className="grid grid-cols-1 items-center justify-center gap-4">
                    <Link to="/login">
                        <Button className="w-full text-[15px]" size="lg">
                            Login
                        </Button>
                    </Link>

                    <Link to="/signup">
                        <Button variant="outline" className="w-full text-[15px]" size="lg">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    )
}
