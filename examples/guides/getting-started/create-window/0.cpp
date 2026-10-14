#include <kraken/KrakenEngine.hpp>

int main() {
    kn::init();
    kn::window::create("Kraken Example", 900, 500);

    while (kn::window::isOpen()) {
        kn::event::poll();
        kn::renderer::clear();
        kn::renderer::present();
    }

    kn::quit();
    return 0;
}
