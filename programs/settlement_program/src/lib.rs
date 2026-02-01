use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod settlement_program {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        base_mint: Pubkey,
        quote_mint: Pubkey,
        fee_rate_bps: u16,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.base_mint = base_mint;
        market.quote_mint = quote_mint;
        market.fee_rate_bps = fee_rate_bps;
        Ok(())
    }

    pub fn settle_trades(
        ctx: Context<SettleTrades>,
        trades: Vec<TradeData>,
    ) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.authority.key(),
            ctx.accounts.market.authority,
            ErrorCode::Unauthorized
        );

        // For each trade, transfer tokens
        // This is simplified; in reality, need to handle accounts properly

        for trade in trades {
            // Transfer base token maker -> taker
            // Transfer quote token taker -> maker
            // Collect fees
            emit!(TradeSettled {
                maker: trade.maker,
                taker: trade.taker,
                price: trade.price,
                quantity: trade.quantity,
            });
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 32 + 2)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleTrades<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
    // Remaining accounts: token accounts
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub fee_rate_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TradeData {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub price: u64,
    pub quantity: u64,
    pub side: u8, // 0 buy, 1 sell
}

#[event]
pub struct TradeSettled {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub price: u64,
    pub quantity: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}