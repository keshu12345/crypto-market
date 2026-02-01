// Stub for orderbook program
use anchor_lang::prelude::*;

declare_id!("OrderBookProgram11111111111111111111111111");

#[program]
pub mod orderbook_program {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>) -> Result<()> {
        // TODO
        Ok(())
    }

    pub fn place_order(ctx: Context<PlaceOrder>) -> Result<()> {
        // TODO
        Ok(())
    }

    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        // TODO
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    // TODO
}

#[derive(Accounts)]
pub struct PlaceOrder<'info> {
    // TODO
}

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    // TODO
}

#[account]
pub struct Market {
    // TODO
}

#[account]
pub struct Order {
    // TODO
}